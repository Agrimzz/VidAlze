import { View, Text, FlatList, RefreshControl } from "react-native"
import React, { useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import SearchInput from "@/components/SearchInput"
import EmptyState from "@/components/EmptyState"
import { getSavedVideosForUser, searchPosts } from "@/lib/appwrite"
import useAppWrite from "@/lib/useAppWrite"
import VideoCard from "@/components/VideoCard"
import { useLocalSearchParams } from "expo-router"
import { useGlobalContext } from "@/context/GlobalProvider"

const Search = () => {
  const { user } = useGlobalContext()
  const { data: posts, refetch } = useAppWrite(() =>
    getSavedVideosForUser(user.$id)
  )

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item: any) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 ">
            <Text className="text-2xl font-psemibold text-white">
              Saved Videos
            </Text>
            {/* <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} />
            </View> */}
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  )
}

export default Search
