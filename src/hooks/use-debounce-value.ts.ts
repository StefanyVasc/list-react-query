/*
 * para nao fazer a requisição a cada vez que o usuário digitar algo no input
 * é estrategia para causar um delay. Basicamente ele fica observando a ação e
 * quando ela parar é feito algo
 */

import { useEffect, useState } from 'react'

export default function useDebounceValue<T = unknown>(value: T, delay: number) {
  const [debounceValue, setDebounceValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debounceValue
}
