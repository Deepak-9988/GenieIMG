import { View, Text } from 'react-native'
import React, { useState } from 'react'

export default function HomeScreen() {

    const [prompt, setPrompt]=useState("");
    const [imageUri, setImageUri]=useState(null)

  return (
    <View>
      <Text>HomeScreen</Text>
    </View>
  )
}