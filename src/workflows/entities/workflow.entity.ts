import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  webhookUrl: string;

  @Column({ nullable: true })
  reprocessWebhookUrl: string;

  @Column({ nullable: true })
  reprocessCompleteWebhookUrl: string;

  @Column({ nullable: true })
  recreatePromptWebhookUrl: string;

  @Column({ type: 'simple-json', nullable: true })
  inputs: any;

  @Column({ default: 1 })
  cost: number;

  @Column({ default: 1 })
  recreatePromptCost: number;

  @Column({ default: 2 })
  reprocessSceneCost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
