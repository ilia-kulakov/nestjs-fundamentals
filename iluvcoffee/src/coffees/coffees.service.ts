import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { Event } from 'src/events/entities/event.entity/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

@Injectable({ scope: Scope.REQUEST })
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
    @Inject('COFFEE_BRANDS') coffeeBrands: string[],
  ) {
    console.log('CoffeesService instantiated. Coffee brands:');
    console.log(coffeeBrands);

    console.log('Coffees config:');
    console.log(this.coffeesConfiguration);
    console.log(`foo=${this.coffeesConfiguration.foo}`);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number) {
    const coffee = await this.coffeRepository.findOne({
      where: { id: id },
      relations: ['flavors'],
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );
    const coffee = this.coffeRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    return this.coffeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto?.flavors?.map((name) => this.preloadFlavorByName(name)),
      ));
    const coffee = await this.coffeRepository.preload({
      id: id,
      ...updateCoffeeDto,
      flavors,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    return this.coffeRepository.save(coffee);
  }

  async remove(id: number) {
    const coffee = await this.findOne(id);
    return this.coffeRepository.remove(coffee);
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coffee.recommendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);
      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const flavor = await this.flavorRepository.findOne({
      where: { name },
    });

    if (flavor) {
      return flavor;
    }

    return this.flavorRepository.create({ name });
  }
}
