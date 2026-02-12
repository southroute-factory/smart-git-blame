# TASK-092: Create API Key Context Provider

| Field | Value |
|-------|-------|
| **Task ID** | TASK-092 |
| **Story** | STORY-011 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create React context provider for accessing the API key throughout the application.

## Acceptance Criteria

- [ ] Create `ApiKeyContext` with provider
- [ ] Expose `apiKey`, `setApiKey`, `clearApiKey`
- [ ] Load initial value from localStorage
- [ ] Provide `hasApiKey` boolean for conditionals
- [ ] Update localStorage on context changes

## Technical Notes

```typescript
interface ApiKeyContextValue {
  apiKey: string | null;
  hasApiKey: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    setApiKeyState(getApiKey());
  }, []);

  const setApiKey = (key: string) => {
    saveApiKey(key);
    setApiKeyState(key);
  };

  const clearApiKey = () => {
    removeApiKey();
    setApiKeyState(null);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, hasApiKey: !!apiKey, setApiKey, clearApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (!context) throw new Error('useApiKey must be used within ApiKeyProvider');
  return context;
}
```

## Dependencies

- TASK-090

## Blocked By

- localStorage persistence must be working
