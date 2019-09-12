import { Query, Resolver } from 'type-graphql';
import { Test } from './Test';

@Resolver(() => Test)
export class TestResolver {
  @Query(() => Test)
  public testSuccess() {
    return { id: 1 };
  }
}
