<!-- Program page data - START -->
<xsl:if test="document/config/parameter[@name='usesProgramData']">
	
	<!-- Prepare some tools -->
	<xsl:variable name="apos">'</xsl:variable> <!-- Apostrophe character -->
	<xsl:variable name="amp">&amp;</xsl:variable> <!-- Ampersand character -->

	<!-- Get the program database file -->
	<xsl:variable name="programDatabase" >
		<xsl:choose>
			<!-- Check for if this is in a dev context -->
			<xsl:when test="contains($dirname, '-dev/')">
				<xsl:if test="doc-available(concat($c_path, '/programs-dev/database.xml.inc'))">
					<xsl:copy-of select="document(concat($c_path, '/programs-dev/database.xml.inc'))" />
				</xsl:if>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="doc-available(concat($c_path, '/programs/database.xml.inc'))">
					<xsl:copy-of select="document(concat($c_path, '/programs/database.xml.inc'))" />
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

	<!-- Transform the program database table into an array of JSON objects -->
	<script>
		<!-- xsl:text wrappers aren't necessary, they just help minimize the output code -->
		<xsl:text>const programDatabase = [</xsl:text>
			<!-- Iterate through every tr past the first -->
			<xsl:for-each select="$programDatabase//tr[position() > 1]">
				<!-- Create a JSON object -->
				<xsl:text>{</xsl:text>
					<!-- Create each key value pair -->
					<xsl:for-each select="td">
						<xsl:variable name="index" select="position()" />
						<xsl:variable name="columnHeading" select="normalize-space($programDatabase//tr[1]/td[$index])" />
						<!-- Get column heading for key -->
						<xsl:text>"</xsl:text>
						<xsl:value-of select="$columnHeading" />
						<xsl:text>":</xsl:text>
						<!-- Get current cell value for value -->
						<xsl:choose>
							<!-- Handle uniquely for image -->
							<xsl:when test="$columnHeading = 'Image'">
								<xsl:text>'</xsl:text>
								<xsl:choose>
									<!-- If an image is found -->
									<xsl:when test="img">
										<!-- Recreate the img element (necessary for escaping apostrophes) -->
										<xsl:element name="img">
											<xsl:attribute name="src">
												<xsl:value-of select="img/@src" />
											</xsl:attribute>
											<xsl:attribute name="alt">
												<!-- Escape apostrophes in alt text so it doesn't clash with JSON structure -->
												<xsl:value-of select="replace(img/@alt, $apos, concat('\\', $apos))" />
											</xsl:attribute>
										</xsl:element>
									</xsl:when>
									<!-- If an image is not found -->
									<xsl:otherwise>
										<!-- Give it a default image -->
										<img src="/programs/images/main-photos/default.jpg" alt="The entrance of University Hall, framed by a tree in bloom" />
									</xsl:otherwise>
								</xsl:choose>
								<xsl:text>',</xsl:text>
							</xsl:when>
							<!-- Handle uniquely for Slate Form -->
							<xsl:when test="$columnHeading = 'Slate Form'">
								<xsl:text>'</xsl:text>
								<!-- Escape apostrophes in script url (RegEx) -->
								<xsl:variable name="replaced0" select="replace(., concat('(source=.*?)', $apos,'(.*output=)'), '$1%27$2')" />
								<!-- Escape other apostrophes to not clash with JSON structure -->
								<xsl:variable name="replaced1" select="replace($replaced0, $apos, concat('\\', $apos))" />
								<!-- Escape ampersands in script url -->
								<xsl:variable name="replaced2" select="replace($replaced1, concat(' ', $amp, ' '), concat(' ', '%26', ' '))" />
								<!-- Final result -->
								<xsl:value-of select="$replaced2" />
								<xsl:text>',</xsl:text>
							</xsl:when>
							<!-- Handle simply for any other column -->
							<xsl:otherwise>
								<xsl:text>"</xsl:text>
								<xsl:value-of select="normalize-space(.)" />
								<xsl:text>",</xsl:text>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:for-each>
				<xsl:text>},</xsl:text>
			</xsl:for-each>
		<xsl:text>]</xsl:text>
	</script>
	
</xsl:if>
<!-- Program page data - END -->
