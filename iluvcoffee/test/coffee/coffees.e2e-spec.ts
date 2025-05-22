import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateCoffeeDto } from '../../src/coffees/dto/create-coffee.dto/create-coffee.dto';
import * as request from 'supertest';

describe('[Feature] Coffees - /coffees]', () => {
  const coffee = {
    name: 'Shipwreck Roast',
    brand: 'Buddy Brew',
    flavors: ['chocolate', 'vanila'],
  };

  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: '15648977',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication(); // instantiate full Nest runtime environment
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  it('Create [POST, /]', () => {
    return request(app.getHttpServer())
      .post('/coffees')
      .send(coffee as CreateCoffeeDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        const expectedCoffee = jasmine.objectContaining({
          ...coffee,
          flavors: jasmine.arrayContaining(
            coffee.flavors.map((name) => jasmine.objectContaining({ name })),
          ),
        });
        expect(body).toEqual(expectedCoffee);
      });
  });

  it('Get all [GET /]', () => {
    return request(app.getHttpServer())
      .get('/coffees')
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        const expectedCoffees = jasmine.objectContaining([
          {
            id: 1,
            ...coffee,
            recommendations: 0,
            flavors: jasmine.arrayContaining(
              coffee.flavors.map((name) => jasmine.objectContaining({ name })),
            ),
          },
        ]);
        expect(body).toEqual(expectedCoffees);
      });
  });

  it('Get one [GET /:id]', () => {
    return request(app.getHttpServer())
      .get('/coffees/1')
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        const expectedCoffees = jasmine.objectContaining({
          id: 1,
          ...coffee,
          recommendations: 0,
          flavors: jasmine.arrayContaining(
            coffee.flavors.map((name) => jasmine.objectContaining({ name })),
          ),
        });
        expect(body).toEqual(expectedCoffees);
      });
  });
  it.todo('Update one [PATCH /:id]');
  it.todo('Delete one [DELETE /:id]');

  afterAll(async () => {
    await app.close();
  });
});
