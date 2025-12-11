import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@stxryai.com';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Send email
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  welcome: (username: string) => ({
    subject: 'Welcome to StxryAI! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Welcome to StxryAI, ${username}!</h1>
        <p>We're excited to have you join our community of storytellers and readers.</p>
        <p>Get started by:</p>
        <ul>
          <li>Exploring stories in your favorite genres</li>
          <li>Creating your first interactive story</li>
          <li>Customizing your profile</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/discover"
           style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
          Start Exploring
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Questions? Reply to this email or visit our help center.
        </p>
      </div>
    `,
  }),

  storyPublished: (storyTitle: string, storyUrl: string) => ({
    subject: `Your story "${storyTitle}" is now live! 📚`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Congratulations! 🎉</h1>
        <p>Your story "<strong>${storyTitle}</strong>" has been published successfully.</p>
        <p>Readers can now discover and enjoy your creation. Share it with your followers and watch the reads roll in!</p>
        <a href="${storyUrl}"
           style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
          View Your Story
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Track your story's performance in the analytics dashboard.
        </p>
      </div>
    `,
  }),

  newFollower: (followerUsername: string, followerProfileUrl: string) => ({
    subject: `${followerUsername} started following you! 👋`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">You have a new follower!</h1>
        <p><strong>${followerUsername}</strong> is now following you on StxryAI.</p>
        <a href="${followerProfileUrl}"
           style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
          View Profile
        </a>
      </div>
    `,
  }),

  newComment: (storyTitle: string, commenterUsername: string, storyUrl: string) => ({
    subject: `New comment on "${storyTitle}" 💬`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">New Comment</h1>
        <p><strong>${commenterUsername}</strong> commented on your story "<strong>${storyTitle}</strong>".</p>
        <a href="${storyUrl}"
           style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
          View Comment
        </a>
      </div>
    `,
  }),

  achievementUnlocked: (achievementTitle: string, achievementDescription: string) => ({
    subject: `Achievement Unlocked: ${achievementTitle}! 🏆`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">🏆 Achievement Unlocked!</h1>
        <h2>${achievementTitle}</h2>
        <p>${achievementDescription}</p>
        <p style="margin-top: 30px; color: #666;">
          Keep creating and reading to unlock more achievements!
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/achievements"
           style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
          View All Achievements
        </a>
      </div>
    `,
  }),

  subscriptionConfirmed: (tier: string, price: number) => ({
    subject: `Welcome to ${tier}! 🌟`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Welcome to ${tier}! 🌟</h1>
        <p>Your subscription is now active at $${price}/month.</p>
        <p>You now have access to:</p>
        <ul>
          <li>Unlimited energy</li>
          <li>Ad-free reading experience</li>
          <li>Exclusive premium stories</li>
          <li>And much more!</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/billing"
           style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
          Manage Subscription
        </a>
      </div>
    `,
  }),

  passwordReset: (resetUrl: string) => ({
    subject: 'Reset your StxryAI password 🔒',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Reset Your Password</h1>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
          Reset Password
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  }),
};
