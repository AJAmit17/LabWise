import { View, Text } from 'react-native'
import React from 'react'
const ProfilePage = (id: string) => {
    return (
        <View style={{ backgroundColor: "#eee" }}>
            <Text>{id}</Text>
        </View>
    )
}
export default ProfilePage