import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum Roles {
  owner = 'owner',
  manager = 'manager',
  cashier = 'cashier',
}

export enum Status {
  active = 'active',
  deactive = 'deactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  profile_picture: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @Column({
    nullable: true,
  })
  phone_number?: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.cashier,
  })
  role: Roles;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.active,
  })
  status: Status;

  @Column({
    default: false,
  })
  is_email_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
