"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { userApi } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { Loader2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const steps = ['Profile', 'Privacy', 'Notifications']

export default function OnboardingPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    privacyLevel: 'friends' as 'private' | 'friends' | 'public',
    enableNotifications: true,
  })

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await handleComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await userApi.updateMe({
        username: formData.username,
        bio: formData.bio,
        privacyLevel: formData.privacyLevel,
      })
      
      if (formData.enableNotifications) {
        // Request notification permission
        if ('Notification' in window) {
          await Notification.requestPermission()
        }
      }

      await refreshUser()
      router.push('/feed')
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to complete onboarding',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStep
                      ? 'bg-accent-primary text-background'
                      : 'bg-background-secondary text-foreground-tertiary'
                  }`}
                >
                  {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-16 mx-2 ${
                      index < currentStep ? 'bg-accent-primary' : 'bg-background-secondary'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold">{steps[currentStep]}</h2>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                <p className="text-xs text-foreground-tertiary">
                  3-20 characters, letters and numbers only
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your music taste..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  maxLength={150}
                  rows={3}
                />
                <p className="text-xs text-foreground-tertiary text-right">
                  {formData.bio.length}/150
                </p>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-foreground-secondary">
                Choose who can see your daily songs and interact with your posts.
              </p>
              <div className="space-y-3">
                {[
                  { value: 'private', label: 'Private', desc: 'Only you can see your music' },
                  { value: 'friends', label: 'Friends Only', desc: 'Only friends you add can see' },
                  { value: 'public', label: 'Public', desc: 'Anyone can see and follow you' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, privacyLevel: option.value as any })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.privacyLevel === option.value
                        ? 'border-accent-primary bg-accent-primary/5'
                        : 'border-border bg-background-secondary hover:border-border-hover'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-foreground-secondary">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-foreground-secondary">
                Get notified when your song of the day is ready at 9:30pm.
              </p>
              <button
                onClick={() => setFormData({ ...formData, enableNotifications: !formData.enableNotifications })}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  formData.enableNotifications
                    ? 'border-accent-primary bg-accent-primary/5'
                    : 'border-border bg-background-secondary'
                }`}
              >
                <div className="font-semibold">Enable Browser Notifications</div>
                <div className="text-sm text-foreground-secondary">
                  We'll notify you daily when your song is ready
                </div>
              </button>
              <p className="text-xs text-foreground-tertiary">
                You can change this later in settings
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={loading}
            >
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleNext}
            disabled={loading || (currentStep === 0 && !formData.username)}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
