import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from './screens/SplashScreen';
import UserLoginScreen from './screens/UserLoginScreen';
import UserRegisterScreen from './screens/UserRegisterScreen';
import UserDashboardScreen from './screens/UserDashboardScreen';
import BookingStatusScreen from './screens/BookingStatusScreen';
import ClientBookingScreen from './screens/ClientBookingScreen';
import DestinationSelectionScreen from './screens/DestinationSelectionScreen';
import GovernorateSelectionScreen from './screens/GovernorateSelectionScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import LiveDriversMapScreen from './screens/LiveDriversMapScreen';
import PackageDetailsScreen from './screens/PackageDetailsScreen';
import PaymentSelectionScreen from './screens/PaymentSelectionScreen';
import ServiceSelectionScreen from './screens/ServiceSelectionScreen';
import SubmitReviewScreen from './screens/SubmitReviewScreen';
import TimeSelectionScreen from './screens/TimeSelectionScreen';
import TripHistoryScreen from './screens/TripHistoryScreen';
import TripInProgressScreen from './screens/TripInProgressScreen';
import UserAuthSelectionScreen from './screens/UserAuthSelectionScreen';
import UserGovernorateSelection from './screens/UserGovernorateSelection';
import UserServiceSelection from './screens/UserServiceSelection';
import UserTypeSelectionScreen from './screens/UserTypeSelectionScreen';
import UserTripMapScreen from './screens/UserTripMapScreen';
import WelcomeScreen from './screens/WelcomeScreen';

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserLoginScreen" component={UserLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserRegisterScreen" component={UserRegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserDashboardScreen" component={UserDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BookingStatusScreen" component={BookingStatusScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ClientBookingScreen" component={ClientBookingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DestinationSelectionScreen" component={DestinationSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GovernorateSelectionScreen" component={GovernorateSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LanguageSelectionScreen" component={LanguageSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LiveDriversMapScreen" component={LiveDriversMapScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PackageDetailsScreen" component={PackageDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentSelectionScreen" component={PaymentSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ServiceSelectionScreen" component={ServiceSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SubmitReviewScreen" component={SubmitReviewScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TimeSelectionScreen" component={TimeSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TripHistoryScreen" component={TripHistoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TripInProgressScreen" component={TripInProgressScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserAuthSelectionScreen" component={UserAuthSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserGovernorateSelection" component={UserGovernorateSelection} options={{ headerShown: false }} />
        <Stack.Screen name="UserServiceSelection" component={UserServiceSelection} options={{ headerShown: false }} />
        <Stack.Screen name="UserTypeSelectionScreen" component={UserTypeSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserTripMapScreen" component={UserTripMapScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
