# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - heading "Blame View" [level=1] [ref=e6]
        - generic [ref=e7]:
          - paragraph [ref=e8]: "Repository: /nonexistent/repo"
          - paragraph [ref=e9]: "File: file.ts"
      - alert [ref=e10]:
        - img [ref=e11]
        - heading "File Not Found" [level=3] [ref=e13]
        - paragraph [ref=e14]: "Repository path does not exist: /nonexistent/repo"
        - paragraph [ref=e15]: "Field: repo"
      - link "← Back to Home" [ref=e16] [cursor=pointer]:
        - /url: /
      - dialog [ref=e17]:
        - generic [ref=e19]:
          - heading [level=2] [ref=e20]: Commit Details
          - button [ref=e21]:
            - img [ref=e22]
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]:
    - img [ref=e31]
  - alert [ref=e34]
```