import useApi from '@/composables/useApi'
import { DefaultApi, type CreateWithFriendsGameGuessRequestGuess } from '@/services'

const useWithFriendsGameApi = () => {
  const { apiConfig } = useApi()
  const gamesApi = new DefaultApi(apiConfig)

  const createGame = () => gamesApi.createWithFriendsGame()

  const joinGame = (roomKey: string) =>
    gamesApi.joinWithFriendsGame({ joinWithFriendsGameRequest: { roomKey } })

  const startGame = (gameId: string) => gamesApi.startWithFriendsGame({ gameId })

  const submitGuess = (
    gameId: string,
    roundNumber: number,
    guess: CreateWithFriendsGameGuessRequestGuess,
  ) =>
    gamesApi.createWithFriendsGameGuess({
      gameId,
      roundNumber,
      createWithFriendsGameGuessRequest: { guess },
    })

  return { createGame, joinGame, startGame, submitGuess }
}

export default useWithFriendsGameApi
