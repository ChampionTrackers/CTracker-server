import { app } from '@/app';
import request from 'supertest';

describe('PATCH /users', () => {
  beforeAll(async () => {
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  it('should be able to edit an existing user', async () => {
    await request(app.server).post('/v1/users').send({
      email: 'dummy@ctracker.com',
      name: 'Dummy User',
      nickname: 'dummyuser',
      password: 'testing123',
      picture: null,
    });

    const token = await request(app.server).post('/v1/sessions/password').send({
      email: 'dummy@ctracker.com',
      password: 'testing123',
    });

    const response = await request(app.server)
      .patch('/v1/users')
      .set('Authorization', `Bearer ${token.body.token}`)
      .send({
        data: {
          name: 'Dummy User 2',
          nickname: 'dummyuser2',
        },
        password: 'testing123',
      });

    expect(response.statusCode).toBe(204);
  });

  it('should not be able to edit an user with an invalid password', async () => {
    await request(app.server).post('/v1/users').send({
      email: 'dummy@ctracker.com',
      name: 'Dummy User',
      nickname: 'dummyuser',
      password: 'testing123',
      picture: null,
    });

    const token = await request(app.server).post('/v1/sessions/password').send({
      email: 'dummy@ctracker.com',
      password: 'testing123',
    });

    const response = await request(app.server)
      .patch('/v1/users')
      .set('Authorization', `Bearer ${token.body.token}`)
      .send({
        data: {
          name: 'Dummy User 2',
          nickname: 'dummyuser2',
        },
        password: '123testing',
      });

    expect(response.statusCode).toBe(401);
  });

  it('should not be able to edit an user with an invalid token', async () => {
    await request(app.server).post('/v1/users').send({
      email: 'dummy@ctracker.com',
      name: 'Dummy User',
      nickname: 'dummyuser',
      password: 'testing123',
      picture: null,
    });

    const response = await request(app.server)
      .patch('/v1/users')
      .set('Authorization', `Bearer TRANSFORMERS`)
      .send({
        data: {
          name: 'Dummy User 2',
          nickname: 'dummyuser2',
        },
        password: 'testing123',
      });

    expect(response.statusCode).toBe(401);
  });

  it('should not be able to edit an user with the same nickname', async () => {
    await request(app.server).post('/v1/users').send({
      email: 'dummy@ctracker.com',
      name: 'Dummy User',
      nickname: 'dummyuser',
      password: 'testing123',
      picture: null,
    });

    await request(app.server).post('/v1/users').send({
      email: 'johndoe42@ctracker.com',
      name: 'John Doe',
      nickname: 'johndoe',
      password: 'testing123',
      picture: null,
    });

    const token = await request(app.server).post('/v1/sessions/password').send({
      email: 'dummy@ctracker.com',
      password: 'testing123',
    });

    const response = await request(app.server)
      .patch('/v1/users')
      .set('Authorization', `Bearer ${token.body.token}`)
      .send({
        data: {
          name: 'Dummy User 2',
          nickname: 'johndoe',
        },
        password: 'testing123',
      });

    expect(response.statusCode).toBe(409);
  });

  it('should not be able to edit an user with the same email', async () => {
    await request(app.server).post('/v1/users').send({
      email: 'dummy@ctracker.com',
      name: 'Dummy User',
      nickname: 'dummyuser',
      password: 'testing123',
      picture: null,
    });

    await request(app.server).post('/v1/users').send({
      email: 'johndoe42@ctracker.com',
      name: 'John Doe',
      nickname: 'johndoe',
      password: 'testing123',
      picture: null,
    });

    const token = await request(app.server).post('/v1/sessions/password').send({
      email: 'dummy@ctracker.com',
      password: 'testing123',
    });

    const response = await request(app.server)
      .patch('/v1/users')
      .set('Authorization', `Bearer ${token.body.token}`)
      .send({
        data: {
          name: 'Dummy User 2',
          email: 'johndoe42@ctracker.com',
        },
        password: 'testing123',
      });

    expect(response.statusCode).toBe(409);
  });

  it('should not be able to edit an user with an invalid email', async () => {
    await request(app.server).post('/v1/users').send({
      email: 'dummy@ctracker.com',
      name: 'Dummy User',
      nickname: 'dummyuser',
      password: 'testing123',
      picture: null,
    });

    const token = await request(app.server).post('/v1/sessions/password').send({
      email: 'dummy@ctracker.com',
      password: 'testing123',
    });

    const response = await request(app.server)
      .patch('/v1/users')
      .set('Authorization', `Bearer ${token.body.token}`)
      .send({
        data: {
          name: 'Dummy User 2',
          email: 'dummyctracker.com',
        },
        password: 'testing123',
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to edit an user with an invalid nickname', async () => {
    await request(app.server).post('/v1/users').send({
      email: 'dummy@ctracker.com',
      name: 'Dummy User',
      nickname: 'dummyuser',
      password: 'testing123',
      picture: null,
    });

    const token = await request(app.server).post('/v1/sessions/password').send({
      email: 'dummy@ctracker.com',
      password: 'testing123',
    });

    const response = await request(app.server)
      .patch('/v1/users')
      .set('Authorization', `Bearer ${token.body.token}`)
      .send({
        data: {
          name: 'Dummy User 2',
          nickname: 'john doe',
        },
        password: 'testing123',
      });

    expect(response.statusCode).toBe(400);
  });
});
