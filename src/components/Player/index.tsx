import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import Slider from 'rc-slider'

import { usePlayer } from '../../contexts/PlayerContext'
import { useTheme } from '../../contexts/ThemeContext'

import 'rc-slider/assets/index.css'

import styles from './styles.module.sass'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'

export function Player() {

    const {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        hasNext,
        hasPrevious,
        playNext,
        playPrevious,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        clearPlayerState
    } = usePlayer()

    const {isDark} = useTheme()

    const audioRef = useRef<HTMLAudioElement>(null)
    const episode = episodeList[currentEpisodeIndex]
    const [progress, setProgess] = useState(0)

    function setupProgressListener () {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgess(Math.floor(audioRef.current.currentTime))
        })
    }

    function handleSeek (amount: number) {
        setProgess(amount)
        audioRef.current.currentTime = amount
    }

    function handleEpisodeEnded () {
        if (hasNext) {
            playNext()
        } else {
            setProgess(0)
            clearPlayerState()
        }
    }

    useEffect(() => {
        if (!audioRef.current){
            return
        }

        isPlaying ? audioRef.current.play() : audioRef.current.pause()

    }, [isPlaying])

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora</strong>
            </header>

            {episode ? (
                <div className={styles.currentEpisode}>
                    <Image width={592} height={592} src={episode.thumbnail} objectFit="cover"/>
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty: ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>

                    <div className={styles.slider}>
                        {episode ? (
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={isDark ? {backgroundColor: 'rgb(4, 211, 97)'} : {backgroundColor: '#04d361'}}
                                railStyle={isDark ? {backgroundColor: '#9F75FF'} : {backgroundColor: '#9f75ff'}}
                                handleStyle={isDark ? {borderColor: 'rgb(4, 211, 97)', borderWidth: 4} : {borderColor: '#04d361', borderWidth: 4}}
                            />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                    </div>

                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                { episode && (
                    <audio
                      src={episode.url}
                      ref={audioRef}
                      autoPlay
                      loop={isLooping}
                      onEnded={handleEpisodeEnded}
                      onPlay={() => setPlayingState(true)}
                      onPause={() => setPlayingState(false)}
                      onLoadedMetadata={setupProgressListener}
                    />
                ) }

                <div className={styles.buttons}>
                    <button
                      type="button"
                      disabled={!episode || episodeList.length === 1}
                      onClick={toggleShuffle}
                      className={isShuffling ? styles.isActive : ''}
                    >
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>

                    <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior"/>
                    </button>

                    <button
                      type="button"
                      data-action="play"
                      disabled={!episode}
                      onClick={togglePlay}
                    >
                        { isPlaying ? (
                            <img src="/pause.svg" alt="Tocar"/>
                        ) : (
                            <img src="/play.svg" alt="Tocar"/>
                        ) }
                    </button>

                    <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxíma"/>
                    </button>

                    <button
                      type="button"
                      disabled={!episode}
                      onClick={toggleLoop}
                      className={isLooping ? styles.isActive : ''}
                    >
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
            </footer>
        </div>
    )
}