import { Text, TouchableOpacity } from 'react-native'

const Button = ({
  title,
  handlePress,
  style,
  textColor,
}) => {
  return (
    <TouchableOpacity
    onPress={handlePress}
    activeOpacity={0.7}
    className={`${style} h-14 rounded justify-center`}
    >
      <Text
      className={`${textColor} font-kregular text-lg text-center`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default Button