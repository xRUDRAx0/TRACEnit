import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Recorder from './pages/Recorder';
import ActivityPage from './pages/Activity';
import Workflows from './pages/Workflows';
import AutomationsList from './pages/AutomationsList';
import ExecutionsList from './pages/ExecutionsList';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Builder from './pages/Builder';
import Execution from './pages/Execution';
import Analysis from './pages/Analysis';
import AgentView from './pages/AgentView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { ObservationProvider } from './context/ObservationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ObservationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Application Layout Routes */}
              <Route path="/" element={<Layout />}>
                {/* Landing page accessible publicly */}
                <Route index element={<Home />} />

                {/* Authenticated Protected Routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="activity"
                  element={
                    <ProtectedRoute>
                      <ActivityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="workflows"
                  element={
                    <ProtectedRoute>
                      <Workflows />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="automations"
                  element={
                    <ProtectedRoute>
                      <AutomationsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="executions"
                  element={
                    <ProtectedRoute>
                      <ExecutionsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="recorder"
                  element={
                    <ProtectedRoute>
                      <Recorder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="analysis"
                  element={
                    <ProtectedRoute>
                      <Analysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="agent-view"
                  element={
                    <ProtectedRoute>
                      <AgentView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="builder"
                  element={
                    <ProtectedRoute>
                      <Builder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="execute/:runId"
                  element={
                    <ProtectedRoute>
                      <Execution />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="insights"
                  element={
                    <ProtectedRoute>
                      <Insights />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </ObservationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
