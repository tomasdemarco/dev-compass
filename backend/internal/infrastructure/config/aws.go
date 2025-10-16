package config

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
	"github.com/aws/aws-sdk-go-v2/service/ssm/types"
	"log"
	"os"
	"strings"
)

type Aws struct {
	Region string
}

func LoadAwsCredential() *aws.Config {
	awsRegion, awsRegionFound := os.LookupEnv("AWS_REGION")
	if !awsRegionFound {
		log.Fatal("env AWS_REGION not found")
	}

	cfg, _ := awsConfig.LoadDefaultConfig(
		context.Background(),
		awsConfig.WithRegion(awsRegion),
	)
	return &cfg
}

func SetAwsSession(awsConfig aws.Config) *ssm.Client {

	ssmClient := ssm.NewFromConfig(awsConfig)

	return ssmClient
}

func LoadSSMParameters(ssmClient *ssm.Client, path string, prefix string) error {
	input := &ssm.GetParametersByPathInput{
		Path:           aws.String(path),
		WithDecryption: aws.Bool(true),
		Recursive:      aws.Bool(true),
	}

	paginator := ssm.NewGetParametersByPathPaginator(ssmClient, input)

	var allParameters []types.Parameter
	pageCount := 0

	for paginator.HasMorePages() {
		pageCount++
		output, err := paginator.NextPage(context.TODO())
		if err != nil {
			log.Fatalf("Error al obtener la página %d de parámetros: %v", pageCount, err)
		}

		fmt.Printf("Página %d, Parámetros recibidos: %d\n", pageCount, len(output.Parameters))
		allParameters = append(allParameters, output.Parameters...)
	}

	for _, param := range allParameters {
		fmt.Println(*param.Name)
		key := prefix + strings.ToUpper(strings.Replace(strings.TrimPrefix(*param.Name, path), "/", "_", -1))
		fmt.Println(key)
		err := os.Setenv(key, *param.Value)
		if err != nil {
			return fmt.Errorf("error setting environment variable '%s': %w", key, err)
		}
	}

	return nil
}
