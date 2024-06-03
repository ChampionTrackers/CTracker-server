import { faker } from '@faker-js/faker'
import { prisma } from '../src/lib/prisma'
import { generateHash } from '../src/utils/hash'
import { generateName } from './utils/nicknameGenerator';

async function seed() {
    await prisma.teamChampionship.deleteMany()
    await prisma.team.deleteMany()
    await prisma.championship.deleteMany()
    await prisma.user.deleteMany()

    await prisma.$executeRaw`ALTER SEQUENCE "tb_team_team_idteam_seq" RESTART WITH 1;`
    await prisma.$executeRaw`ALTER SEQUENCE "tb_championship_cha_idchampionship_seq" RESTART WITH 1;`
    await prisma.$executeRaw`ALTER SEQUENCE "tb_user_user_iduser_seq" RESTART WITH 1;`

    // Cria usuários
    for (let i = 0; i < 25; i++) {
        await prisma.user.create({
            data: {
                email: faker.internet.email(),
                password: await generateHash('dev'),
                name: faker.person.fullName(),
                nickname: generateName(),
                picture: faker.image.avatar(),
            },
        })
    }

    // Cria equipes
    for (let i = 0; i < 10; i++) {
        await prisma.team.create({
            data: {
                userId: faker.number.int({ min: 1, max: 25 }),
                name: `${faker.word.adjective()} ${faker.word.noun()}`,
                maxPlayers: faker.number.int(10),
                description: faker.word.words(10),
                picture: faker.image.urlLoremFlickr(),
            },
        })
    }

    // Cria campeonatos
    for (let i = 0; i < 15; i++) {
        await prisma.championship.create({
            data: {
                userId: faker.number.int({ min: 1, max: 25 }),
                name: `${faker.word.adjective()} ${faker.word.noun()} championship`,
                description: faker.word.words(10),
                game: faker.word.sample(),
                status: 'ACTIVE',
                type: 'VIRTUAL',
                picture: faker.image.url(),
            },
        })
    }

    // Adiciona equipes aos campeonatos
    for (let i = 0; i < 10; i++) {
        await prisma.teamChampionship.createMany({
            data: [
                {
                    teamId: faker.number.int({ min: 1, max: 10 }),
                    championshipId: 1,
                },
                {
                    teamId: faker.number.int({ min: 1, max: 10 }),
                    championshipId: 2,
                },
                {
                    teamId: faker.number.int({ min: 1, max: 10 }),
                    championshipId: 3,
                },
            ],
            skipDuplicates: true,
        })
    }
}

seed()
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
    .finally(() => {
        console.log('Database seeded! 🌱')
        prisma.$disconnect()
    })
