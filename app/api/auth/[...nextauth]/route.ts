import { NextAuthOptions } from 'next-auth';
import { userService } from '@/lib/services/user.service';

export const authOptions: NextAuthOptions = {
  // ... your existing auth configuration ...
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Create or update user in PostgreSQL
        await userService.createOrUpdateUser({
          id: user.id,
          email: user.email!,
          name: user.name,
          avatarUrl: user.image
        });
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    
    async session({ session, user }) {
      try {
        // Fetch user data from PostgreSQL
        const dbUser = await userService.getUserById(user.id);
        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser.id,
            preferences: dbUser.preferences
          };
        }
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    }
  }
}; 