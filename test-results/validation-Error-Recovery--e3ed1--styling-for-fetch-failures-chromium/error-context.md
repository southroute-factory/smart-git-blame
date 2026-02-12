# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - heading "Blame View" [level=1] [ref=e6]
        - generic [ref=e7]:
          - paragraph [ref=e8]: "Repository: /root/web-app/test-fixtures/sample-repo"
          - paragraph [ref=e9]: "File: src/example.ts"
      - alert [ref=e10]:
        - img [ref=e11]
        - heading "Connection Error" [level=3] [ref=e13]
        - paragraph [ref=e14]: Failed to fetch
        - button "Try again" [ref=e15]:
          - img [ref=e16]
          - text: Try again
      - link "← Back to Home" [ref=e18] [cursor=pointer]:
        - /url: /
      - dialog [ref=e19]:
        - generic [ref=e21]:
          - heading [level=2] [ref=e22]: Commit Details
          - button [ref=e23]:
            - img [ref=e24]
  - button "Open Next.js Dev Tools" [ref=e32] [cursor=pointer]:
    - img [ref=e33]
  - alert [ref=e36]
```