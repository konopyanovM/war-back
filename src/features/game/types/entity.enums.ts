export enum EntityState {
  Idle,
  Move,
  Engage,
  Attack,
  Dying,
  Dead,
}

export enum EntityType {
  Unit,
  Building,
}

export enum EntityArea {
  Collision,
  Vision,
  Attack,
}

export enum Entity {
  // Building
  Castle,
  // Units
  Knight,
  Spearman,
  Archer,
}

export enum Projectile {
  Arrow,
}

export enum AttackType {
  Melee,
  Ranged,
}
