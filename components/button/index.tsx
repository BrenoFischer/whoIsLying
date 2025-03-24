import { Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";

type Variant = 'primary' | 'secondary' | 'disabled';

interface ButtonProps {
    text: string
    variants?: Variant
    onPress: () => void
}

export default function Button({ text, variants = 'primary', onPress }: ButtonProps) {
    const disabled: boolean = variants === "disabled"
    let buttonStyle;
    let buttonTextStyle;
    
    if(variants === "primary") {
        buttonStyle = styles.primaryButton
        buttonTextStyle = styles.primaryButtonText 
    } else if(variants === "secondary") {

    } else if(variants === "disabled") {
        buttonStyle = styles.disabledButton
        buttonTextStyle = styles.disabledButtonText
    }

    return(
        <TouchableOpacity style={[styles.buttonStyle, buttonStyle]} onPress={onPress} disabled={disabled} >
            <Text style={buttonTextStyle}>{text}</Text>
        </TouchableOpacity>
    )
}