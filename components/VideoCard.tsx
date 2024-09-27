import { View, Text, Image, TouchableOpacity, Alert } from "react-native"
import React, { useState, useEffect } from "react"
import { icons } from "@/constants"
import { ResizeMode, Video } from "expo-av"
import { saveVideoForUser, getSavedVideosForUser } from "@/lib/appwrite" // Import getSavedVideosForUser
import { useGlobalContext } from "@/context/GlobalProvider"

const VideoCard = ({
  video: {
    title,
    thumbnail,
    video,
    creator: { username, avatar },
  },
  id,
}: any) => {
  const { user } = useGlobalContext()
  const [play, setPlay] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const checkIfVideoIsSaved = async () => {
      try {
        const savedVideos = await getSavedVideosForUser(user?.$id)
        if (savedVideos.includes(id)) {
          setIsSaved(true)
          console.log(savedVideos)
        }
      } catch (error) {
        console.error("Error checking saved videos: ", error)
      }
    }
    checkIfVideoIsSaved()
  }, [id, user?.$id])

  const handleSaveVideo = async () => {
    try {
      await saveVideoForUser(id, user?.$id)
      Alert.alert("Success", "Video saved successfully!")
      setIsSaved(true) // Mark the video as saved after saving
      setMenuVisible(false)
    } catch (error) {
      console.error("Error saving video: ", error)
      Alert.alert("Error", "Failed to save the video.")
    }
  }

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[48px] h-[48px] rounded-lg border border-secondary-100 justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="contain"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        <View className="pt-2 relative">
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Image
              source={icons.menu}
              className="2-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>
          {menuVisible && (
            <View className="absolute top-8 right-0 bg-gray-800 py-2 rounded-md w-[100px] h-auto z-99">
              <TouchableOpacity>
                <Text
                  className="text-white text-center font-psemibold text-sm"
                  onPress={isSaved ? () => {} : handleSaveVideo} // Disable save if already saved
                >
                  {isSaved ? "Saved" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status: any) => {
            if (status.didJustFinish) {
              setPlay(false)
            }
          }}
          isLooping={false}
          onError={(error) => console.error("Video Error: ", error)}
        />
      ) : (
        <TouchableOpacity
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute "
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default VideoCard
