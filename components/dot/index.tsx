import { ColorValue, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

interface DotProps {
    color: ColorValue
}

export default function Dot({color}: DotProps) {
    return(
        <View
            style={{
            backgroundColor: color,
            width: scale(8),
            height: verticalScale(8),
            borderRadius: '50%',
            marginHorizontal: scale(8),
            }}
        />
    )
}