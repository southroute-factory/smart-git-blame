# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - link "Settings" [ref=e4] [cursor=pointer]:
        - /url: /settings
        - img [ref=e5]
        - text: Settings
    - main [ref=e8]:
      - generic [ref=e9]:
        - heading "Git Blame Viewer" [level=1] [ref=e10]
        - paragraph [ref=e11]: Enter a repository path and file path to view blame information.
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Repository Path
          - generic [ref=e15]:
            - textbox "Repository Path" [ref=e16]:
              - /placeholder: /path/to/repo
            - button "Browse for repository" [ref=e17]:
              - img [ref=e18]
          - alert [ref=e20]: Repository path is required
        - generic [ref=e21]:
          - generic [ref=e22]: File Path
          - generic [ref=e23]:
            - textbox "File Path" [ref=e24]:
              - /placeholder: src/file.ts
            - button "Browse for file" [ref=e25]:
              - img [ref=e26]
          - alert [ref=e29]: File path is required
        - button "View Blame" [disabled] [ref=e30]
  - button "Open Next.js Dev Tools" [ref=e36] [cursor=pointer]:
    - img [ref=e37]
  - alert [ref=e40]
```