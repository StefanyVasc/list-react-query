import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Filter, MoreHorizontal, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Header } from './components/header'
import { Pagination } from './components/pagination'
import { Tabs } from './components/tabs'
import { Button } from './components/ui/button'
import { Control, Input } from './components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table'
// import useDebounceValue from './hooks/use-debounce-value.ts'

export interface Tag {
  title: string
  amountOfVideos: number
  id: string
}

export interface TagResponse {
  first: number
  prev: number | null
  next: number
  last: number
  pages: number
  items: number
  data: Tag[]
}

export function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFilter = searchParams.get('filter') ?? ''
  const [filter, setFilter] = useState(urlFilter)
  // const debouncedFilter = useDebounceValue(filter, 1000)

  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1

  const { data: tagsResponse, isLoading } = useQuery<TagResponse>({
    /*
     * para a paginação na queryKey é preciso ter a page porque todos os dados estão
     * em cache de acordo com a key (que não está sendo modificada e por isso não
     * há refetch). Por isso cada parâmetro usado na queryFn deve ser incluído na
     * queryKey. Assim eu garanto que há uma queryKey diferente para cada página
     */
    queryKey: ['get-tags', page, urlFilter],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlFilter}`,
      )
      const data = await response.json()

      return data
    },
    /*
     * está acontecendo um "layout shift" pois a requisição está sendo feita e
     * demora um pouco para trazer os dados. Usando o placeHolderData e keepPreviousData
     * ele tira o layout shift porque ele só mostrará o conteúdo da próxima página
     * quando a requisição for concluída
     */
    placeholderData: keepPreviousData,
  })

  if (isLoading) {
    return null
  }

  const handleFilter = () => {
    setSearchParams((params) => {
      params.set('page', '1')
      // add o filter na URL
      params.set('filter', filter)

      return params
    })
  }

  return (
    <div className="py-10 space-y-8">
      <div>
        <Header />
        <Tabs />
      </div>

      <main className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-xl">Tags</h1>
          <Button variant="primary">
            <Plus className="size-3" />
            Create new
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Input variant="filter">
              <Search className="size-3" />
              <Control
                placeholder="Search tags..."
                onChange={(e) => setFilter(e.target.value)}
                value={filter}
              />
            </Input>
            <Button type="submit" onClick={handleFilter}>
              <Filter className="dize-3" />
              Filter
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Amount of videos</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tagsResponse?.data.map((tag) => {
              return (
                <TableRow key={tag.id}>
                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{tag.title}</span>
                      <span className="text-xs text-zinc-500">{tag.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {tag.amountOfVideos} video(s)
                  </TableCell>
                  <TableCell className="text-right ">
                    <Button size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {tagsResponse && (
          <Pagination
            pages={tagsResponse.pages}
            items={tagsResponse.items}
            page={page}
          />
        )}
      </main>
    </div>
  )
}
