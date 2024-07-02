import {
  AttackType,
  Entity,
  EntityParameters,
  EntityType,
  Projectile,
} from '../types';

export const entityParameters: Record<Entity, EntityParameters> = {
  [Entity.Castle]: {
    size: {
      width: 200,
      height: 200,
    },
    type: EntityType.Building,
    maxHealth: 2000,
    attackDamage: 0,
    attackSpeed: 2000,
    speed: 0,
    visionRadius: 500,
    attackRadius: 200,
  },
  [Entity.Knight]: {
    size: {
      width: 50,
      height: 50,
    },
    maxHealth: 300,
    attackDamage: 500,
    attackSpeed: 2000,
    speed: 200,
    visionRadius: 400,
    attackRadius: 35,
    attackFrame: 6,
  },
  [Entity.Spearman]: {
    size: {
      width: 40,
      height: 40,
    },
    maxHealth: 100,
    attackDamage: 10,
    attackSpeed: 2000,
    speed: 60,
    visionRadius: 300,
    attackRadius: 35,
    attackFrame: 6,
  },
  [Entity.Archer]: {
    size: {
      width: 40,
      height: 40,
    },
    maxHealth: 40,
    attackType: AttackType.Ranged,
    attackDamage: 20,
    attackSpeed: 2000,
    projectile: Projectile.Arrow,
    projectileSpeed: 500,
    speed: 50,
    visionRadius: 300,
    attackRadius: 250,
    attackFrame: 6,
  },
};
