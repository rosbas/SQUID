import React, { useEffect } from 'react'
import { View} from 'react-native'

import {
  createStackNavigator,
  StackActions,
  NavigationActions,
} from 'react-navigation'
import { COLORS } from '../styles'
import { AuthStack } from './1-Auth/AuthStack'
import { OnboardingStack } from './2-Onboarding/OnboardingStack'
import { MainAppStack } from './3-MainApp/MainAppStack'
import { applicationState } from '../state/app-state'
import { QuestionaireStack } from './4-Questionaire/QuestionaireStack'
import { PrivacyPolicy } from './PrivacyPolicy'
import { HomeStack } from './0-Home/HomeStack'

const Root = ({ navigation }) => {
  useEffect(() => {
    const redirect = async () => {
      const registered = (
        applicationState.getData('isRegistered') ||
        applicationState.getData('skipRegistration')
      )
      const onboarded = applicationState.getData('isPassedOnboarding')
      const isFilledQuestionaire = applicationState.getData(
        'filledQuestionaireV2',
      )
      
      const routeName = registered
        ? onboarded
          ? isFilledQuestionaire
            ? 'MainApp'
            : 'Questionaire'
          : 'Onboarding'
        : 'Home'
      
      const action = StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName
          }),
        ],
        key: null,
      })
      navigation.dispatch(action)
    }
    redirect()
  }, [])

  return <View style={{ flex: 1, backgroundColor: COLORS.PRIMARY_DARK }} />
}

export default createStackNavigator(
  {
    Root: {
      screen: Root,
    },
    Home: {
      screen: HomeStack
    },
    Auth: {
      screen: AuthStack,
    },
    Onboarding: {
      screen: OnboardingStack,
    },
    MainApp: {
      screen: MainAppStack,
    },
    Questionaire: {
      screen: QuestionaireStack,
    },
    PrivacyPolicy: {
      screen: PrivacyPolicy,      
    }
  },
  {
    initialRouteName: 'Root',
    mode: 'modal',
    headerMode: 'none'
  },
)
