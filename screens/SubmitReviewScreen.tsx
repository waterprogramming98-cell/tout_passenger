// screens/SubmitReviewScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';
import { submitReview } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'SubmitReview'>;

/* ================= Star Rating ================= */

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
}

const emojis = ['😡', '😕', '😐', '😊', '😍'];

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate }) => {
  const scales = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(1))
  ).current;

  const animateStar = (index: number) => {
    Animated.sequence([
      Animated.timing(scales[index], {
        toValue: 1.4,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scales[index], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (value: number, index: number) => {
    // ✅ React Native CLI haptic feedback
    HapticFeedback.trigger('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });

    animateStar(index);
    onRate(value);
  };

  return (
    <>
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star, index) => (
          <TouchableOpacity
            key={star}
            activeOpacity={0.8}
            onPress={() => handlePress(star, index)}
          >
            <Animated.Text
              style={[
                styles.star,
                rating >= star ? styles.starFilled : styles.starEmpty,
                { transform: [{ scale: scales[index] }] },
              ]}
            >
              {rating >= star ? '★' : '☆'}
            </Animated.Text>
          </TouchableOpacity>
        ))}
      </View>

      {rating > 0 && (
        <Text style={styles.emoji}>{emojis[rating - 1]}</Text>
      )}
    </>
  );
};

/* ================= Screen ================= */

const SubmitReviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedLanguage, token, bookingDetails } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const getText = (en: string, ar: string) =>
    selectedLanguage === 'Arabic' ? ar : en;

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert(
        getText('Error', 'خطأ'),
        getText(
          'Please select a star rating.',
          'يرجى تحديد تقييم بالنجوم.'
        )
      );
      return;
    }

    setLoading(true);
    try {
      await submitReview(
        bookingDetails.booking_id,
        rating,
        comment,
        token
      );

      HapticFeedback.trigger('notificationSuccess');

      Alert.alert(
        getText('Thank You!', 'شكراً لك!'),
        getText(
          'Your review has been submitted.',
          'تم إرسال تقييمك بنجاح.'
        ),
        [{ 
          text: 'OK', 
          onPress: () => navigation.replace('UserDashboardScreen', {
            selectedLanguage,
            token,
            userData: bookingDetails?.user
          }) 
        }]
      );
    } catch (error: any) {
      Alert.alert(getText('Error', 'خطأ'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {getText('Rate Your Ride', 'قيّم رحلتك')}
        </Text>

        <Text style={styles.captainName}>
          {bookingDetails.captain_name}
        </Text>

        <StarRating rating={rating} onRate={setRating} />

        <TextInput
          style={styles.commentInput}
          placeholder={getText(
            'Leave a comment (optional)',
            'اترك تعليقاً (اختياري)'
          )}
          placeholderTextColor="#777"
          value={comment}
          onChangeText={setComment}
          multiline
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={handleSubmitReview}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.submitButtonText}>
              {getText('Submit Review', 'إرسال التقييم')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Skip Review */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.replace('UserDashboardScreen', {
            selectedLanguage,
            token,
            userData: bookingDetails?.user
          })}
        >
          <Text style={styles.skipText}>
            {getText('Skip Review', 'تخطي التقييم')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SubmitReviewScreen;

/* ================= Styles ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1C1C1C',
    borderRadius: 18,
    padding: 25,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  captainName: {
    fontSize: 18,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 25,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  star: {
    fontSize: 44,
    marginHorizontal: 6,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#444',
  },
  emoji: {
    textAlign: 'center',
    fontSize: 40,
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    color: '#FFD700',
    textAlignVertical: 'top',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#111',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  skipText: {
    color: '#FFD700',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
