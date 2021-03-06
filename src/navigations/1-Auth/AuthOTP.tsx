import React, { useState, useEffect } from 'react'
import { useNavigation } from 'react-navigation-hooks'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
} from 'react-native'
import { COLORS, FONT_FAMILY, FONT_SIZES, FONT_BOLD } from '../../styles'
import { PrimaryButton } from '../../components/Button'
import AntIcon from 'react-native-vector-icons/AntDesign'
import { requestOTP, mobileParing } from '../../api'
import { useHUD } from '../../HudView'
import { useResetTo } from '../../utils/navigation'
import { applicationState } from '../../state/app-state'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import { Link } from '../../components/Base'
import { userPrivateData } from '../../state/userPrivateData'
import { FormHeader } from '../../components/Form/FormHeader'

import I18n from '../../../i18n/i18n';

function formatPhoneNumber(phoneNumberString) {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return match[1] + '-' + match[2] + '-' + match[3]
  }
  return null
}

export const AuthOTP = () => {
  const { showSpinner, hide } = useHUD()
  const navigation = useNavigation()
  const phone = navigation.getParam('phone')
  const triggerOTP = navigation.getParam('triggerOTP')
  const onBack = navigation.getParam('onBack')
  const backIcon = navigation.getParam('backIcon')
  const [otp, setOtp] = useState('')
  const resetTo = useResetTo()
  const mobileNumber = navigation.state.params.phone
  const onSubmit = async () => {
    showSpinner()
    try {
      const bool = await mobileParing(mobileNumber.replace(/-/g, ''), otp)
      if (!bool) {
        Alert.alert(I18n.t('wrong_pwd'))
        hide()
        return
      }
      hide()
      applicationState.setData('isRegistered', true)
      if (applicationState.getData('isPassedOnboarding')) {
        resetTo({ routeName: 'MainApp' })
      } else {
        resetTo({ routeName: 'Onboarding' })
      }
    } catch (err) {
      console.log(err)
      hide()
      Alert.alert(I18n.t('error'))
    }
  }
  useEffect(() => {
    if (otp.length === 4) {
      onSubmit()
    }
  }, [otp])
  const sendOTP = async () => {
    showSpinner()
    try {
      await requestOTP(phone)
      hide()
    } catch (err) {
      Alert.alert(I18n.t('error'))
      hide()
    }
  }
  useEffect(() => {
    if (triggerOTP) {
      sendOTP()
    }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
        <FormHeader onBack={onBack} backIcon={backIcon}>
          <View style={styles.header}>
            <Text style={styles.title}>{I18n.t('enter_otp_from_sms')}</Text>
            <Text style={styles.subtitle}>
              {I18n.t('send_to_phone_no')} {formatPhoneNumber(mobileNumber)}
            </Text>
          </View>
        </FormHeader>
        <View style={styles.content}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: 280,
              maxWidth: '100%',
            }}
          >
            <OTPInputView
              keyboardType={'phone-pad'}
              codeInputFieldStyle={{
                backgroundColor: COLORS.WHITE,
                borderRadius: 4,
                borderColor: COLORS.GRAY_2,
                borderWidth: 1,
                fontSize: FONT_SIZES[700],
                fontFamily: FONT_FAMILY,
                color: COLORS.BLACK_1,
                margin: 4,
                height: 60,
                width: 60,
              }}
              style={{ height: 60 }}
              onCodeFilled={code => setOtp(code)}
              pinCount={4}
            />
          </View>
          <TouchableOpacity
            onPress={sendOTP}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 32,
            }}
          >
            <AntIcon name="reload1" size={24} color={COLORS.BLACK_1} />
            <Text style={styles.text}>{I18n.t('resend_the_code')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            disabled={otp.length !== 4}
            style={{ width: '100%' }}
            containerStyle={{ width: '100%' }}
            title={I18n.t('next')}
            onPress={onSubmit}
          />
          <TouchableOpacity
            style={{ marginTop: 8 }}
            onPress={() => {
              applicationState.setData('skipRegistration', true)
              if (applicationState.getData('isPassedOnboarding')) {
                resetTo({ routeName: 'MainApp' })
              } else {
                navigation.navigate({
                  routeName: 'Onboarding',
                  params: { phone },
                })
              }
            }}
          >
            <Link style={{ color: '#576675', textDecorationLine: 'underline' }}>
              {I18n.t('use_without_iden_confirm')} >
            </Link>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    marginBottom: 16,
    marginHorizontal: 24,
  },
  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    alignItems: 'center',
    color: COLORS.BLACK_1,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES[500],
    lineHeight: 24,
    alignItems: 'center',
    color: COLORS.SECONDARY_DIM,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_BLUE,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.BORDER_LIGHT_BLUE,
  },

  container: { flex: 1, backgroundColor: COLORS.WHITE },
  text: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES[500],
    lineHeight: 32,
    marginLeft: 8,
    color: COLORS.BLACK_1,
  },
  errorText: {
    color: COLORS.RED,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
    paddingHorizontal: 24,
  },
})
