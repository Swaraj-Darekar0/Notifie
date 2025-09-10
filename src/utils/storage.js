import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TASKS: '@taskmanager_tasks',
  SETTINGS: '@taskmanager_settings'
};

export const StorageUtils = {
  // Task Management
  async saveTasks(tasks) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error);
      return false;
    }
  },

  async loadTasks() {
    try {
      const tasksString = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return tasksString ? JSON.parse(tasksString) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  async addTask(task) {
    try {
      const tasks = await this.loadTasks();
      const newTask = {
        id: Date.now().toString(), // Simple ID generation
        ...task,
        createdAt: new Date().toISOString(),
        completed: false
      };
      tasks.push(newTask);
      await this.saveTasks(tasks);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  },

  async updateTask(taskId, updates) {
    try {
      const tasks = await this.loadTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        await this.saveTasks(tasks);
        return tasks[taskIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  },

  async deleteTask(taskId) {
    try {
      const tasks = await this.loadTasks();
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      await this.saveTasks(filteredTasks);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },

  // Task Filtering
  async getTodayTasks() {
    try {
      const tasks = await this.loadTasks();
      const today = new Date().toISOString().split('T')[0];
      return tasks.filter(task => task.dueDate === today);
    } catch (error) {
      console.error('Error getting today tasks:', error);
      return [];
    }
  },
  
// Get task by ID
async getTaskById(taskId) {
  try {
    const tasks = await this.loadTasks();
    return tasks.find(task => task.id === taskId) || null;
  } catch (error) {
    console.error('Error getting task by ID:', error);
    return null;
  }
},
  async getTomorrowTasks() {
    try {
      const tasks = await this.loadTasks();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      return tasks.filter(task => task.dueDate === tomorrowString);
    } catch (error) {
      console.error('Error getting tomorrow tasks:', error);
      return [];
    }
  }
};