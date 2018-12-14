package fr.inra.urgi.datadiscovery.harvest;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Base64;
import java.util.Optional;

import fr.inra.urgi.datadiscovery.dao.HarvestResultDao;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.doc.DocumentationConfig;
import org.hamcrest.CoreMatchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static fr.inra.urgi.datadiscovery.doc.DocUtils.docGet;
import static fr.inra.urgi.datadiscovery.doc.DocUtils.docPost;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.pathParameters;
import static org.springframework.restdocs.request.RequestDocumentation.requestParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REST-Docs tests for {@link HarvesterController}
 * @author JB Nizet
 */
@ExtendWith({SpringExtension.class, RestDocumentationExtension.class})
@WebMvcTest(controllers = HarvesterController.class, secure = false)
@AutoConfigureRestDocs
@Import(DocumentationConfig.class)
class HarvesterControllerDocTest {

    private static final String USER = "rare";
    private static final String PASSWORD = "f01a7031fc17";

    @MockBean
    private AsyncHarvester mockAsyncHarvester;

    @MockBean
    private HarvestResultDao mockHarvestResultDao;

    @MockBean
    private RareDocumentDao mockDocumentDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void shouldHarvest() throws Exception {
        mockMvc.perform(docPost("/api/harvests")
                            .header("Authorization", basicAuth(USER, PASSWORD)))
               .andExpect(status().isCreated())
               .andExpect(header().string(HttpHeaders.LOCATION, CoreMatchers.containsString("/api/harvests")))
               .andDo(document("harvests/post"));
    }

    @Test
    void shouldGet() throws Exception {
        HarvestResult harvestResult =
            HarvestResult.builder()
                         .withStartInstant(Instant.now().minus(50, ChronoUnit.SECONDS))
                         .withFile(HarvestedFile.builder("plant.json")
                                                .addSuccesses(4321)
                                                .addError(4790,
                                                          "Error while parsing object: com.fasterxml.jackson.databind.exc.MismatchedInputException: Cannot deserialize instance of `java.lang.String` out of START_ARRAY token\n at [Source: UNKNOWN; line: -1, column: -1] (through reference chain: fr.inra.urgi.datadiscovery.domain.Document[\"name\"])",
                                                          105594,
                                                          4)
                                                .build())
                         .withFile(HarvestedFile.builder("microbial.json")
                                                .addSuccesses(25)
                                                .build())
                         .end();

        when(mockHarvestResultDao.findById(harvestResult.getId())).thenReturn(Optional.of(harvestResult));

        mockMvc.perform(docGet("/api/harvests/{id}", harvestResult.getId())
                            .header("Authorization", basicAuth(USER, PASSWORD)))
               .andExpect(status().isOk())
               .andDo(document("harvests/get",
                               pathParameters(parameterWithName("id").description("The ID of the harvest")),
                               responseFields(
                                   fieldWithPath("id").description("The unique ID of the harvest"),
                                   fieldWithPath("startInstant").description("The instant when the harvest job started"),
                                   fieldWithPath("endInstant")
                                       .optional()
                                       .description("The instant when the harvest job finished. Null if it's not finished yet"),

                                   fieldWithPath("duration")
                                       .optional()
                                       .description("The duration of the job when finished, in the ISO-8601 representation. Null if it's not finished yet"),
                                   fieldWithPath("globalErrors").description("An array of global errors. Such a global error would exist, for example, for each file that can't be read"),
                                   fieldWithPath("files").description("An array of files that have been harvested. Files that have not been harvested yet are not listed."),
                                   fieldWithPath("files[].fileName").description("The name of the harvested file"),
                                   fieldWithPath("files[].successCount").description("The number of resources in the files that have been harvested successfully"),
                                   fieldWithPath("files[].errorCount").description("The number of resources in the files that couldn't be harvested due to an error"),
                                   fieldWithPath("files[].errors").description("The errors that occurred while harvesting the file (one per failed resource)"),
                                   fieldWithPath("files[].errors[].index").description("The index, starting at 0, of the resource in the JSON file"),
                                   fieldWithPath("files[].errors[].error").description("The text of the error. The example error here shows that the name property, which is supposed to be a string, couldn't be parsed because it was an array"),
                                   fieldWithPath("files[].errors[].line").description("The line number, in the JSON file, of the error. It's actually the line of the end of the resource object"),
                                   fieldWithPath("files[].errors[].column").description("The column number, in the JSON file, of the error. It's actually the column of the end of the resource object")
                                   )));
    }

    @Test
    void shouldList() throws Exception {
        HarvestResult harvestResult =
            HarvestResult.builder()
                         .withStartInstant(Instant.now().minus(50, ChronoUnit.SECONDS))
                         .end();

        PageRequest pageRequest = PageRequest.of(0, HarvesterController.PAGE_SIZE);
        when(mockHarvestResultDao.list(pageRequest))
            .thenReturn(new PageImpl<>(Arrays.asList(harvestResult), pageRequest, 1));

        mockMvc.perform(docGet("/api/harvests")
                            .header("Authorization", basicAuth(USER, PASSWORD)))
               .andExpect(status().isOk())
               .andDo(document("harvests/list",
                               responseFields(
                                   fieldWithPath("number").description("The number of the page, starting at 0"),
                                   fieldWithPath("size").description("The size of the page"),
                                   fieldWithPath("totalElements").description("The total number of harvests"),
                                   fieldWithPath("maxResults").ignored(),
                                   fieldWithPath("totalPages").description("The total number of pages of harvests"),
                                   fieldWithPath("content").description("The array of harvests contained in the requested page"),
                                   fieldWithPath("content[].id").description("The unique ID of the harvest"),
                                   fieldWithPath("content[].url").description("The URL of the harvest, that you can use to get the details of that harvest"),
                                   fieldWithPath("content[].startInstant").description("The instant when the harvest job started"),
                                   fieldWithPath("content[].endInstant").description("The instant when the harvest job finished. Null if it's not finished yet"))));
    }

    @Test
    void shouldListSecondPage() throws Exception {
        HarvestResult harvestResult =
            HarvestResult.builder()
                         .withStartInstant(Instant.now().minus(50, ChronoUnit.SECONDS))
                         .end();

        PageRequest pageRequest = PageRequest.of(1, HarvesterController.PAGE_SIZE);
        when(mockHarvestResultDao.list(pageRequest))
            .thenReturn(new PageImpl<>(Arrays.asList(harvestResult), pageRequest, HarvesterController.PAGE_SIZE + 1));

        mockMvc.perform(docGet("/api/harvests")
                            .header("Authorization", basicAuth(USER, PASSWORD))
                            .param("page", "1"))
               .andExpect(status().isOk())
               .andDo(document("harvests/list2",
                               requestParameters(
                                   parameterWithName("page")
                                       .optional()
                                       .description("The requested page number, starting at 0"))));
    }

    private String basicAuth(String user, String password) {
        return "Basic " + Base64.getEncoder().encodeToString((user + ":" + password).getBytes(StandardCharsets.UTF_8));
    }
}
