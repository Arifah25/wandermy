import { Text, TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const Button = ({
  title,
  handlePress,
  style,
  textColor,
  location,
}) => {
  return (
    <TouchableOpacity
    onPress={handlePress}
    activeOpacity={0.7}
    className={`${style} h-14 rounded justify-center flex-row items-center`}
    >
      {location?
      (
      // <Ionicons name="pin" size={24} color="black" />
      <FontAwesome6 name="map-pin" size={24} color="black"  />
      ):(null)}
      <Text
      className={`${textColor} font-kregular text-lg text-center`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default Button