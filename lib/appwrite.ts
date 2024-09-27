import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite"
export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.agrimzz.vidalze",
  projectId: "66f530f6000ef4ece689",
  databaseId: "66f531ef0021d4336f7e",
  userCollectionId: "66f5320f003b7d5763fd",
  videoCollectionId: "66f532270026c3e7acb2",
  storageId: "66f5334500176e0046ce",
}

const client = new Client()

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform)

const account = new Account(client)
const avatars = new Avatars(client)
const databases = new Databases(client)
const storage = new Storage(client)

//Create User SignUp
export const createUser = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    )
    if (!newAccount) throw Error
    const avatarUrl = avatars.getInitials(username)
    await signIn(email, password)
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      { accountId: newAccount.$id, email, username, avatar: avatarUrl }
    )

    return newUser
  } catch (error) {
    console.log(error)
  }
}

//User Signin
export async function signIn(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password)
    return session
  } catch (error) {
    console.log(error)
  }
}
// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get()

    return currentAccount
  } catch (error: any) {
    throw new Error(error)
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount()
    if (!currentAccount) throw Error

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    )

    if (!currentUser) throw Error

    return currentUser.documents[0]
  } catch (error) {
    console.log(error)
    return null
  }
}

//Fetch Posts
export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt")]
    )

    return posts.documents
  } catch (error) {
    console.log(error)
  }
}

//Get Latest Post
export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt", Query.limit(7))]
    )

    return posts.documents
  } catch (error) {
    console.log(error)
  }
}

//Search Posts
export const searchPosts = async (query: any) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search("title", query)]
    )

    return posts.documents
  } catch (error) {
    console.log(error)
  }
}

//User Posts
export const getUserPosts = async (userId: any) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal("creator", userId)]
    )

    return posts.documents
  } catch (error) {
    console.log(error)
  }
}

//Logout
export const signOut = async () => {
  try {
    const session = await account.deleteSession("current")
    return session
  } catch (error) {
    console.log(error)
  }
}

export const getFilePreview = async (fileId: any, type: any) => {
  let fileUrl

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId)
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      )
    } else {
      throw new Error("Invalid file type")
    }

    if (!fileUrl) throw Error

    return fileUrl
  } catch (error) {
    console.log(error)
  }
}

export const uploadFile = async (file: any, type: any) => {
  if (!file) return

  const { mimeType, ...rest } = file
  const asset = {
    name: file.fileName,
    size: file.fileSize,
    type: file.mimeType,
    uri: file.uri,
  }

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    )
    const fileURL = await getFilePreview(uploadedFile.$id, type)
    return fileURL
  } catch (error) {
    console.log(error)
  }
}

//Upload Video
export const createVideo = async (form: any) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ])

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        prompt: form.prompt,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        creator: form.userId,
      }
    )
    return newPost
  } catch (error) {
    console.log(error)
  }
}

//Save Videos
export const saveVideoForUser = async (videoId: string, userId: string) => {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    )

    const savedVideos = user.saved || []
    if (savedVideos.includes(videoId)) {
      console.log("User has already saved this video.")
      return
    }

    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        saved: [...savedVideos, videoId],
      }
    )

    return updatedUser
  } catch (error) {
    console.log("Error saving video for user:", error)
  }
}

//Get User Saved Videos
export const getSavedVideosForUser = async (userId: string) => {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    )

    return user.saved || []
  } catch (error) {
    console.log("Error fetching saved videos:", error)
  }
}
