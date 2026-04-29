import { Tabs, Slot } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';

export default function ExpertQueriesLayout() {
  const { user } = useAuth();
  const isExpert = user?.role === 'Expert';

  if (isExpert) {
    // For experts, we don't need the tab navigation at all since 
    // we've removed 'Ask an Expert' and 'My Queries'.
    // Slot will just render the index.tsx content directly.
    return <Slot />;
  }

  return (
    <Tabs>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'All Queries'
        }} 
      />
      <Tabs.Screen 
        name="submit" 
        options={{
          title: 'Ask an Expert'
        }} 
      />
      <Tabs.Screen 
        name="my-queries" 
        options={{
          title: 'My Queries'
        }} 
      />
      <Tabs.Screen 
        name="edit" 
        options={{
          title: 'Edit Query',
          href: null // hides it from the bottom tab bar automatically
        }} 
      />
    </Tabs>
  );
}
