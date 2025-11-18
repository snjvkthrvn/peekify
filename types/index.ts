export interface User {
  id: string
  username: string
  email: string
  spotifyId: string
  profilePictureUrl?: string
  bio?: string
  privacyLevel: 'private' | 'friends' | 'public'
  timezone: string
  notificationTime: string
  createdAt: string
  updatedAt: string
}

export interface Song {
  id: string
  spotifyId: string
  name: string
  artist: string
  album: string
  albumArtUrl: string
  durationMs: number
}

export interface SongOfTheDay {
  id: string
  userId: string
  song: Song
  date: string
  playCount: number
  totalListeningTimeMs: number
  createdAt: string
}

export interface Post extends SongOfTheDay {
  user: User
  reactions: Reaction[]
  commentCount: number
}

export interface Reaction {
  id: string
  postId: string
  userId: string
  user: User
  emoji: '🔥' | '❤️' | '💀' | '😭' | '🎯' | '👀' | '🤔' | '😍'
  createdAt: string
}

export interface Comment {
  id: string
  postId: string
  userId: string
  user: User
  text: string
  likes: number
  createdAt: string
}

export interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export interface UserStats {
  topTracks: Array<{
    song: Song
    playCount: number
  }>
  topArtists: Array<{
    name: string
    imageUrl: string
    playCount: number
  }>
  topGenres: Array<{
    name: string
    playCount: number
  }>
}

export interface NotificationSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}
