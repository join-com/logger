import 'reflect-metadata'
import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class Test {
  @Field(() => Number)
  public id!: number
}
