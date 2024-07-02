import { AttackType, EntityType, Projectile } from './entity.enums';
import { Size } from './interfaces';

export interface EntityParameters {
  size: Size;
  type?: EntityType;

  cost?: number;

  maxHealth?: number;
  health?: number;

  attackType?: AttackType;
  attackDamage?: number;
  attackSpeed?: number;

  projectile?: Projectile;
  projectileSpeed?: number;

  speed?: number;

  visionRadius?: number;
  collisionRadius?: number;
  attackRadius?: number;

  attackFrame?: number;
}
