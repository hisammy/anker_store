package main

import (
  "fmt"
  "os"
  "io/ioutil"
  "path/filepath"
  "strings"
  "regexp"
  "github.com/SebastianCzoch/onesky-go"
)

// 调用onesky API 上传下载脚本, By: Leon.Xu (anker-ost.oneskyapp.com)
// dev:
  // go run ./tools/i18n.go // 打印基本语言(源语言)文件列表
  // go run ./tools/i18n.go upload test // 上传源语言文件
  // go run ./tools/i18n.go download test JP // 下载翻译的语言包
  // go run ./tools/i18n.go info frontend // 项目已上传文件的状态
  // or: npm run i18n upload test
// build: go build -o ./tools/i18n ./tools/i18n.go && ./tools/i18n

// go get github.com/SebastianCzoch/onesky-go
// https://github.com/onesky/api-documentation-platform

// check if string in array
func isValueInList(value string, list []string) bool {
    for _, v := range list {
        if v == value {
            return true
        }
    }
    return false
}
// return a list of all files
func walker(rootPath string) ([]string, error) {
  files := []string{}
  infos, err := ioutil.ReadDir(rootPath)
  for _, f := range infos {
    // ext := filepath.Ext(file.Name())
    ignores := []string{"Thumbs.db"} // {"a", "b", "c"}
    if f.IsDir() || f.Name()[0:1] == "." || isValueInList(f.Name(), ignores) { // ignores (.DS_Store, .Trashes)
      continue
    }
    absPath, _ := filepath.Abs(filepath.Join(rootPath, f.Name()))
    // fmt.Println(f.Name(), absPath)
    files = append(files, absPath)
  }
  return files, err
}
// format json (去掉: 注释, 多余的,号, 空格)
func formatJson(contents string) (string) {
  // remove comments (/* ...comments */)
  contents = regexp.MustCompile(`\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+`).ReplaceAllString(contents, "")
  // remove multi lines (strings.TrimSpace 会把\n\t\r\n都替换掉)
  contents = regexp.MustCompile(`(\r|\n)`).ReplaceAllString(contents, "")
  // remove last comma(,)
  contents = regexp.MustCompile(`,\s*\}`).ReplaceAllString(contents, "}")
  contents = regexp.MustCompile(`,\s*\]`).ReplaceAllString(contents, "]")
  // remove spaces
  contents = regexp.MustCompile(`\s+`).ReplaceAllString(contents, " ")
  return contents
}
func detectFileFormat(path string) (string) { // https://git.io/vVQ0F
  fileFormat := ""
  ext := strings.ToLower(filepath.Ext(path))
  switch ext {
    case ".json":
      fileFormat = "HIERARCHICAL_JSON"
    case ".yml":
      fileFormat = "RUBY_YAML"
    default:
      fileFormat = "HIERARCHICAL_JSON"
  }
  // fmt.Println("ext", ext, fileFormat)
  return fileFormat
}
// Get informations
func infos(onesky onesky.Client) {
  list, err := onesky.ListFiles(1, 100)
  if err != nil {
    fmt.Println("info", err)
  } else {
    // fmt.Println(list)
    fmt.Println("files info:")
    for _, item := range list {
      // fmt.Printf("%+v\n", item)
      fmt.Println(item.Name, item.LastImport, item.UpoladedAt)
    }
  }
}
// Upload files
func upload(project map[string]interface{}, files []string, onesky onesky.Client) {
  tmpFolder := "./.tmp"
  os.MkdirAll(tmpFolder, 0755)
  for _, file := range files {
    filename := filepath.Base(file)
    ext := filepath.Ext(filename)
    bytes, err := ioutil.ReadFile(file)
    if err != nil {
      fmt.Println(filename, err)
      continue
    }
    contents := string(bytes)
    // fmt.Println(contents)
    if ext == ".json" {
      contents = formatJson(contents)
    }
    // fmt.Println(file, contents)

    tmpFile := filepath.Join(tmpFolder, filename)
    ioutil.WriteFile(tmpFile, []byte(contents), 0644) // 上传格式化后的JSON文件

    fileFormat := detectFileFormat(tmpFile)
    // fmt.Println(filename, fileFormat)

    err = onesky.UploadFile(tmpFile, fileFormat, project["base_locale"].(string))
    if err != nil {
      fmt.Println(filename, err)
    } else {
      fmt.Printf("Uploaded: %v\n", filename)
    }
  }
  os.RemoveAll(tmpFolder)
}
// Download files
func download(targetPath string, targetLocale string, files []string, onesky onesky.Client) {
  os.MkdirAll(targetPath, 0755)
  for _, file := range files {
    filename := filepath.Base(file)
    contents, err := onesky.DownloadFile(filename, targetLocale)
    targetFile := filepath.Join(targetPath, filename)
    // fmt.Println(targetFile, contents, err)
    if err != nil {
      fmt.Println(filename, err)
    } else {
      err := ioutil.WriteFile(targetPath, []byte(contents), 0644)
      if err != nil {
        fmt.Println(filename, err)
      } else {
        fmt.Printf("Downloaded: %v\n", targetFile)
      }
    }
  }
}

func main() {
  // Current Languages: "en", "ja", "de"
  args := os.Args[1:]
  pwd, _ := os.Getwd()
  // cwd, _ := filepath.Abs(filepath.Dir(os.Args[0]))
  // if strings.Contains(cwd, pwd) { // Compiled

  onesky := onesky.Client{
    APIKey: "Kawsgmt1YuXxtkMKDVDjyZcAVhBVGbbh",
    Secret: "qmBgRgZaUMb5I9xpqsi3PMv3c6eb9yJq",
    ProjectID: 0}
  localePath := filepath.Join(pwd, "./src/locales/"); // 语言包根目录

  projects := map[string]map[string]interface{}{
    "frontend": {
      "name": "STORE_FRONT_END",
      "base_locale": "en", // 基本语言
      "base_folder": "US", // 基本语言文件夹
      "id": 146077,
    },
    // "backend": {
    //   "name": "STORE_BACK_END",
    //   "base_locale": "en", // 基本语言
    //   "base_folder": "backend", // 基本语言文件夹
    //   "id": 146143,
    // },
    "test": {
      "name": "TEST",
      "base_locale": "en", // 基本语言
      "base_folder": "test", // 基本语言文件夹
      "id": 146283,
    },
  }
  // fmt.Println(localePath, onesky, projects)

  // action := map[bool]interface{}{true: 111, false: 222}[len(args) > 0] // go不提供三元操作符
  action := ""
  if len(args) > 0 { action = args[0] }
  projectName := ""
  if len(args) > 1 { projectName = args[1] }
  // default value
  if !isValueInList(action, []string{"info", "upload", "download"}) { action = "" }
  if !isValueInList(projectName, []string{"frontend", "test"}) { projectName = "test" }
  // fmt.Println(action, projectName)
  project := projects[projectName]
  // fmt.Println(action, project)

  onesky.ProjectID = project["id"].(int)
  localePathBase := filepath.Join(localePath, project["base_folder"].(string))
  // fmt.Println(project["base_folder"], localePathBase)
  baseFiles, _ := walker(localePathBase) // 语言包文件列表
  // fmt.Println("onesky:", onesky)
  if action == "" { // 没有参数时, 打印文件列表
    fmt.Println("base files:", baseFiles)
    os.Exit(0)
  }

  fmt.Println("==project:", project["name"])
  if action == "info" {
    infos(onesky)
  } else if action == "upload" {
    upload(project, baseFiles, onesky)
  } else if action == "download" {
    maps := map[string]string{ // 文件夹 onesky语言对应关系
      "DE": "de",
      "JP": "ja",
      // "US": "en", // 禁止下载并覆盖基本语言(US)
    }
    if projectName == "test" { // test项目, 可以下载US
      maps["US"] = "en"
    }
    folder := "";
    if len(args) > 2 { folder = args[2] }
    locale, exist := maps[folder]
    // fmt.Println(locale, exist)
    if !exist {
      fmt.Println("Error: Invalid floder name")
      os.Exit(0)
    }
    targetPath := filepath.Join(localePath, folder)

    if projectName == "test" {
      targetPath = filepath.Join(localePath, "test/download")
    }
    download(targetPath, locale, baseFiles, onesky)
  }

}
