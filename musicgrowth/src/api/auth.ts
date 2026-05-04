import { api, tokenStorage } from './client'

export interface AuthUser {
  id: number
  username: string
  email: string
  first_name: string
  voice_level: string
  instrument_level: string
  created_at: string
}

export interface AuthResponse {
  user: AuthUser
  access: string
  refresh: string
}

export const authApi = {
  async register(data: {
    username: string
    email: string
    password: string
    first_name: string
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/api/auth/register/', data)
    tokenStorage.set(res.access, res.refresh)
    return res
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/api/auth/login/', { username, password })
    tokenStorage.set(res.access, res.refresh)
    return res
  },

  async getProfile(): Promise<AuthUser> {
    return api.get<AuthUser>('/api/auth/profile/')
  },

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    return api.patch<AuthUser>('/api/auth/profile/', data)
  },

  logout() {
    tokenStorage.clear()
    window.location.href = '/login'
  },

  isLoggedIn(): boolean {
    return !!tokenStorage.getAccess()
  },
}