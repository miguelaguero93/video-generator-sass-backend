import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class SystemSetting {
  @PrimaryColumn()
  key: string;

  @Column()
  value: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'string' })
  type: 'string' | 'number' | 'boolean' | 'json';

  @UpdateDateColumn()
  updatedAt: Date;
}
