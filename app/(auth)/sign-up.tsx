import { View, Text, ScrollView, Image, Alert } from "react-native"
import React, { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { images } from "../../constants"
import FormField from "@/components/FormField"
import CustomButton from "@/components/CustomButton"
import { Link, router } from "expo-router"
import { createUser } from "@/lib/appwrite"
import { useGlobalContext } from "@/context/GlobalProvider"

const SignUp = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [isSubmiting, setIsSubmiting] = useState(false)
  const { setUser, setIsLogged } = useGlobalContext()

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all the fields")
    } else {
      setIsSubmiting(true)
      try {
        const result = await createUser(
          form.email,
          form.password,
          form.username
        )
        setUser(result)
        setIsLogged(true)

        router.replace("/home")
      } catch (error: any) {
        Alert.alert("Error", error.message)
      } finally {
        setIsSubmiting(false)
      }
    }
  }
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Image
            source={images.logo}
            className="w-[115px] h-[35px]"
            resizeMode="contain"
          />
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
            Sign up to VidAlze
          </Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e: any) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
          />
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: any) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e: any) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmiting}
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Already have an account?
            </Text>
            <Link
              href={"/sign-in" as any}
              className="text-lg font-semibold text-secondary-100"
            >
              Sign In
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp
