import { app } from '@/app';
import request from 'supertest';

describe('POST /users', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be able to create an user', async () => {
    const response = await request(app.server).post('/v1/users').send({
      email: 'johndoe@gmail.com',
      password: 'testing444',
      name: 'John Doe',
      nickname: 'johndoe42',
      picture: null,
    });

    expect(response.statusCode).toBe(201);
  });

  it('should not be able to create an user with an existing email', async () => {
    await request(app.server).post('/v1/users').send({
      email: 'johndoe@gmail.com',
      password: 'hayday2049',
      name: 'Mary Lucy',
      nickname: 'mary4242',
      picture: null,
    });

    const response = await request(app.server).post('/v1/users').send({
      email: 'johndoe@gmail.com',
      password: 'ilovetransformers',
      name: 'John Doe',
      nickname: 'johndoe62',
      picture: null,
    });

    expect(response.statusCode).toBe(409);
  });

  it('should not be able to create an user with an existing nickname', async () => {
    await request(app.server).post('/v1/users').send({
      email: 'johndoe@gmail.com',
      password: 'ilovetransformers',
      name: 'John Doe',
      nickname: 'johndoe42',
      picture: null,
    });

    const response = await request(app.server).post('/v1/users').send({
      email: 'jonasdoenos@hotmail.com',
      password: 'mlpbigfan2008',
      name: 'Jonas Doe',
      nickname: 'johndoe42',
      picture: null,
    });

    expect(response.statusCode).toBe(409);
  });

  it('should not be able to create an user with a nickname containing spaces', async () => {
    const response = await request(app.server).post('/v1/users').send({
      email: 'johndoe@gmail.com',
      password: 'testing444',
      name: 'John Doe',
      nickname: 'john doe roblox',
      picture: null,
    });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to create an user with a password shorter than 8 characters', async () => {
    const response = await request(app.server).post('/v1/users').send({
      email: 'johndoe@gmail.com',
      password: 'test',
      name: 'John Doe',
      nickname: 'johndoe42',
      picture: null,
    });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to create an user with a name shorter than 3 characters', async () => {
    const response = await request(app.server).post('/v1/users').send({
      email: 'johndoe@gmail.com',
      password: 'testing444',
      name: 'Jo',
      nickname: 'johndoe42',
      picture: null,
    });

    expect(response.statusCode).toBe(400);
  })

  it('should not be able to create an user with a username shorter than 3 characters', async () => {
    const response = await request(app.server).post('/v1/users').send({
      email: 'johndoe@gmail.com',
      password: 'testing444',
      name: 'John Doe',
      nickname: 'yo',
      picture: null,
    });

    expect(response.statusCode).toBe(400);
  })
});
