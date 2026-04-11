import { Tabs } from 'expo-router';

export default function ExpertQueriesLayout() {
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
