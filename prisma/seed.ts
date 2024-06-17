import { faker } from '@faker-js/faker'
import { prisma } from '../src/lib/prisma'
import { generateHash } from '../src/utils/hash'
import { generateName } from './utils/nicknameGenerator'

const NUMBER_OF_USERS = 30
const NUMBER_OF_TEAMS = 10
const NUMBER_OF_CHAMPIONSHIPS = 20
const NUMBER_OF_CHAMPIONSHIPS_PER_TEAM = 10
// const NUMBER_OF_MATCHES = 20
// const NUMBER_OF_GUESSES = 5

async function resetDatabase() {
  await prisma.guess.deleteMany()
  await prisma.teamScore.deleteMany()
  await prisma.match.deleteMany()
  await prisma.teamChampionship.deleteMany()
  await prisma.team.deleteMany()
  await prisma.championship.deleteMany()
  await prisma.user.deleteMany()

  await prisma.$executeRaw`ALTER SEQUENCE "tb_team_team_idteam_seq" RESTART WITH 1;`
  await prisma.$executeRaw`ALTER SEQUENCE "tb_championship_cha_idchampionship_seq" RESTART WITH 1;`
  await prisma.$executeRaw`ALTER SEQUENCE "tb_user_user_iduser_seq" RESTART WITH 1;`
  await prisma.$executeRaw`ALTER SEQUENCE "tb_team_score_ts_idteamscore_seq" RESTART WITH 1;`
  await prisma.$executeRaw`ALTER SEQUENCE "tb_match_mat_idmatch_seq" RESTART WITH 1;`
  await prisma.$executeRaw`ALTER SEQUENCE "tb_guess_ges_idguess_seq" RESTART WITH 1;`
}

enum ChampionshipType {
  VIRTUAL = 'VIRTUAL',
  PHYSICAL = 'PHYSICAL',
}

async function createUsers() {
  const userPromises = Array.from({ length: NUMBER_OF_USERS }, async () => {
    return prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: await generateHash('dev'),
        name: faker.person.fullName(),
        nickname: generateName(),
        picture: faker.image.avatar(),
      },
    })
  })
  await Promise.all(userPromises)
}

async function createTeams() {
  const teamPromises = Array.from({ length: NUMBER_OF_TEAMS }, () => {
    return prisma.team.create({
      data: {
        userId: faker.number.int({ min: 1, max: NUMBER_OF_USERS }),
        name: `${faker.word.adjective()} ${faker.word.noun()}`,
        maxPlayers: faker.number.int(10),
        description: faker.word.words(10),
        picture: faker.image.urlLoremFlickr(),
      },
    })
  })
  await Promise.all(teamPromises)
}

async function createChampionships() {
  const championshipPromises = Array.from(
    { length: NUMBER_OF_CHAMPIONSHIPS },
    () => {
      return prisma.championship.create({
        data: {
          userId: faker.number.int({ min: 1, max: NUMBER_OF_USERS }),
          name: `${faker.word.adjective()} ${faker.word.noun()} championship`,
          description: faker.word.words(10),
          game: faker.word.sample(),
          status: 'ACTIVE',
          type: faker.helpers.enumValue(ChampionshipType),
          picture: faker.image.url(),
        },
      })
    },
  )
  await Promise.all(championshipPromises)
}

async function addTeamsToChampionships() {
  const teamChampionshipData: { teamId: number; championshipId: number }[] = []

  for (let teamId = 1; teamId <= NUMBER_OF_TEAMS; teamId++) {
    for (
      let championshipId = 1;
      championshipId <= NUMBER_OF_CHAMPIONSHIPS_PER_TEAM;
      championshipId++
    ) {
      teamChampionshipData.push({
        teamId,
        championshipId,
      })
    }
  }

  await prisma.teamChampionship.createMany({
    data: teamChampionshipData,
    skipDuplicates: true,
  })
}

// async function createMatches() {
//   const matches = Array.from({ length: NUMBER_OF_MATCHES }, () => {
//     return prisma.match.create({
//       data: {
//         championshipId: faker.number.int({
//           min: 1,
//           max: NUMBER_OF_CHAMPIONSHIPS,
//         }),
//         plannedStartTime: faker.date.future(),
//         status: 'SCHEDULED',
//       },
//     })
//   })
//   await Promise.all(matches)
// }

async function seed() {
  try {
    await resetDatabase()
    await createUsers()
    await createTeams()
    await createChampionships()
    await addTeamsToChampionships()
    // await createMatches()
    console.log('Database seeded! 🌱')
  } catch (error) {
    console.log(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
