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
    className={`${style} h-10 rounded justify-center`}
    >
      <Text
      className={`${textColor} font-kregular text-base text-center`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default Button