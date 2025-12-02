import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workflow } from '../../workflows/entities/workflow.entity';

@Entity()
export class Execution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  name: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  workflowId: number;

  @ManyToOne(() => Workflow)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'simple-json', nullable: true })
  data: any; // Stores the initial input or final result summary

  @Column({ type: 'simple-json', nullable: true })
  events: any[]; // Stores the event history

  @CreateDateColumn()
  createdAt: Date;
}
