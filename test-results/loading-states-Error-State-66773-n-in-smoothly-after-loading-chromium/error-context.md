# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - heading "Blame View" [level=1] [ref=e6]
        - generic [ref=e7]:
          - paragraph [ref=e8]: "Repository: /root/web-app/test-fixtures/sample-repo"
          - paragraph [ref=e9]: "File: nonexistent.ts"
      - alert [ref=e10]:
        - img [ref=e11]
        - heading "File Not Found" [level=3] [ref=e13]
        - paragraph [ref=e14]: File not found
      - link "← Back to Home" [ref=e15] [cursor=pointer]:
        - /url: /
      - dialog [ref=e16]:
        - generic [ref=e18]:
          - heading [level=2] [ref=e19]: Commit Details
          - button [ref=e20]:
            - img [ref=e21]
  - button "Open Next.js Dev Tools" [ref=e29] [cursor=pointer]:
    - img [ref=e30]
  - alert [ref=e33]
```