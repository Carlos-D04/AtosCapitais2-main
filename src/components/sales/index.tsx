'use client'

import { CircleDollarSign } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card'
import { Avatar, AvatarImage } from '../ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'

interface Branch {
  name: string
  cnpj: string
}

interface SalesProps {
  branchs: Branch[]
  sales?: any[] 
}

export function Sales({ branchs }: SalesProps) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-lg sm:text-xl text-gray-800">
            Histórico de Consulta
          </CardTitle>
          <CircleDollarSign className="ml-auto w-4 h-4" />
        </div>
      </CardHeader>
      <CardDescription></CardDescription>
      <CardContent>
        {branchs.map((branch, index) => (
          <article key={index} className="flex items-center gap-2 border-b py-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${branch.name}`} />
              <AvatarFallback>DV</AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm sm:text-base font-semibold">{branch.name}</p>
              <span className="text-[12px] sm:text-sm text-gray-400">{branch.cnpj}</span>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  )
}