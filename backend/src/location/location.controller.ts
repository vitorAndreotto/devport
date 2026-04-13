import { Controller, Get, Param, ParseIntPipe, Query, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { State } from './state.entity.js';
import { City } from './city.entity.js';
import { ListCitiesQueryDto } from './dto/list-cities-query.dto.js';

@Controller('locations')
export class LocationController {
  constructor(
    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  @Get('states')
  async listStates() {
    return this.stateRepo.find({ order: { name: 'ASC' } });
  }

  @Get('cities/:cityId')
  async getCity(@Param('cityId', ParseIntPipe) cityId: number) {
    const city = await this.cityRepo.findOne({
      where: { id: cityId },
      relations: ['state'],
    });

    if (!city) {
      throw new NotFoundException('Cidade não encontrada.');
    }

    return city;
  }

  @Get('cities')
  async searchCities(@Query('q') q?: string) {
    if (!q || q.length < 2) return [];

    return this.cityRepo.find({
      where: { name: ILike(`%${q}%`) },
      relations: ['state'],
      order: { name: 'ASC' },
      take: 20,
    });
  }

  @Get('states/:stateId/cities')
  async listCities(
    @Param('stateId', ParseIntPipe) stateId: number,
    @Query() query: ListCitiesQueryDto,
  ) {
    const where: Record<string, unknown> = { stateId };
    if (query.q) {
      where['name'] = ILike(`%${query.q}%`);
    }

    return this.cityRepo.find({
      where,
      order: { name: 'ASC' },
      take: 50,
    });
  }
}
