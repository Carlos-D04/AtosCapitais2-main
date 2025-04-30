'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { login } from '@/services/authService'


export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
  
    try {
      await login({ username: email, password });
  
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token não foi salvo corretamente.');
        return;
      }
  
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4"
      >
        <Card className="w-full shadow-2xl rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex justify-center mb-4">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXzzIfA4JgD9IwRtrhhOtqW39J3NBQundgSg&s"
                alt="Logo"
                className="h-20 w-auto"
              />
            </div>

            <h1 className="text-2xl font-bold text-center mb-4">Bem-vindo</h1>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Login"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <motion.p
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="mt-4 w-full p-4 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100"
              >
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
