import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';

function BookStockFilter({
  query,
}: {
  query: ReturnType<typeof useResourceQuery>;
}) {
  const value =
    query.state.eq?.stockAvailable === 0
      ? 'out'
      : query.state.lte?.stockAvailable !== undefined
        ? 'low'
        : 'all';

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        if (next === 'out')
          query.batch([
            { type: 'set', key: 'eq', value: { stockAvailable: 0 } },
            { type: 'set', key: 'lte', value: undefined },
          ]);
        else if (next === 'low')
          query.batch([
            { type: 'set', key: 'eq', value: undefined },
            { type: 'set', key: 'lte', value: { stockAvailable: 3 } },
          ]);
        else
          query.batch([
            { type: 'set', key: 'eq', value: undefined },
            { type: 'set', key: 'lte', value: undefined },
          ]);
      }}
    >
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="out">Out</TabsTrigger>
        <TabsTrigger value="low">Low</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export { BookStockFilter };
